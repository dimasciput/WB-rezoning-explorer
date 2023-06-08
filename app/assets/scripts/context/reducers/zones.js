import * as topojson from 'topojson-client';
import { fetchJSON, makeAPIReducer } from './reduxeed';
import config from '../../config';
import get from 'lodash.get';
import utf8 from 'utf8';
import zoneScoreColor from '../../styles/zoneScoreColors';
import theme from '../../styles/theme/theme';
import squareGrid from '@turf/square-grid';
import pLimit from 'p-limit';
import { wrapLogReducer } from './../contexeed';
import { apiResourceNameMap, GRID } from '../../components/explore/panel-data';
import { updateLoadingProgress } from '../../components/common/global-loading';

const limit = pLimit(20);
const { apiEndpoint } = config;

async function getZoneSummary (feature, filterString, weights, lcoe, countryResourcePath) {
  let summary = {
    lcoe: 0, zone_score: 0, generation_potential: 0, zone_output_density: 0, cf: 0
  };

  let validSummary = true;
  try {
    summary = (
      await fetchJSON(`${apiEndpoint}/zone${countryResourcePath}?${filterString}`, {
        method: 'POST',
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          aoi: feature.geometry,
          weights,
          lcoe
        })
      })
    ).body;
  } catch (error) {
    // eslint-disable-next-line
    console.log(`Error fetching zone ${feature.properties.id} analysis.`);
    validSummary = false;
  }

  // Set negative values to zero
  Object.keys(summary).forEach(key => {
    if (summary[key] < 0) summary[key] = 0;
  });

  return {
    ...feature,
    id: feature.properties.id,
    properties: {
      color: theme.main.color.base,
      ...feature.properties,
      summary
    },
    is_valid_summary: validSummary,
  };
}

export const fetchZonesReducer = wrapLogReducer(makeAPIReducer('FETCH_ZONES'));
/*
 * Make all asynchronous requests to load zone score from REZoning API
 * dispatch updates to some context using 'dispatch' function
 */
export async function fetchZones (
  selectedArea,
  selectedResource,
  selectedZoneType,
  filterString,
  weights,
  lcoe,
  dispatch
) {
  dispatch({ type: 'REQUEST_FETCH_ZONES' });
  try {
    const { id: areaId, type } = selectedArea;

    let features;

    if (selectedResource === 'Off-Shore Wind') {
      // if offshore wind, we are already in grid and bounds are eez bounds
      features = squareGrid(selectedArea.bounds, parseInt(selectedZoneType.size), {
        units: 'kilometers',
        mask: {
          type: 'FeatureCollection',
          features: selectedArea.eez
        }
      }).features.map((ft, i) => ({ ...ft, properties: { id: i } }));
    } else {
      // Get area topojson
      const { body: zonesTopoJSON } = await fetchJSON(
        `/public/zones/${type}/${areaId}.topojson`
      );

      // Get sub areas from Topojson
      if (selectedZoneType.type == GRID) {
        const areaLimits = topojson.merge(
          zonesTopoJSON,
          zonesTopoJSON.objects[areaId].geometries
        );

        const areaGrid = squareGrid(selectedArea.bounds, parseInt(selectedZoneType.size), {
          mask: areaLimits,
          units: 'kilometers'
        });

        features = areaGrid.features.map((ft, i) => ({
          ...ft,
          properties: { id: i }
        }));
      } else {
        const subAreas = topojson.feature(
          zonesTopoJSON,
          zonesTopoJSON.objects[areaId]
        ).features;

        // Set id from GID, if undefined
        features = subAreas.map((f) => {
          if (typeof f.properties.id === 'undefined') {
            f.properties.id = f.properties.GID_0;
          }
          if (typeof f.properties.name === 'undefined') {
            f.properties.name = f.properties.NAME_0;
          }
          // fix data utf8 encoding
          try {
            f.properties.name = utf8.decode(f.properties.name);
          } catch (error) {
            // eslint-disable-next-line
            console.log('Failed to decode ', f.properties);
          }
          return f;
        });
      }
    }

    // If area of country type, prepare country & resource path string to add to URL
    const countryResourcePath = `/${selectedArea.id}/${apiResourceNameMap[selectedResource]}`;

    // Fetch Lcoe for each sub-area
    const zoneUpdateInterval = setInterval(() => {
      const totalZones = features.length;
      const completeZones = features.length - limit.pendingCount - limit.activeCount;
      updateLoadingProgress(completeZones, totalZones);
    }, 5);

    const zones = await Promise.all(
      features.map((z) =>
        limit(() => getZoneSummary(z, filterString, weights, lcoe, countryResourcePath))
      )
    );
    updateLoadingProgress(0, 0);
    clearInterval(zoneUpdateInterval);

    const validZones = zones.filter( z => z.is_valid_summary );

    const minScore = Math.min(
      ...validZones.map((z) => get(z, 'properties.summary.zone_score', 0))
    );
    const maxScore = Math.max(
      ...validZones.map((z) => get(z, 'properties.summary.zone_score', 0))
    );

    const data = validZones.map((z, index) => {
      if (!get(z, 'properties.summary.zone_score')) return z;

      const zoneScore = z.properties.summary.zone_score / maxScore;
      const color = zoneScoreColor(zoneScore);
      return {
        ...z,
        properties: {
          ...z.properties,
          color,
          summary: {
            ...z.properties.summary,
            zone_score: zoneScore
          }
        }
      };
    });

    data.lcoe = lcoe;
    data.weights = weights;
    dispatch({ type: 'RECEIVE_FETCH_ZONES', data: data });
  } catch (err) {
    dispatch({ type: 'ERROR', error: err });
  }
}
