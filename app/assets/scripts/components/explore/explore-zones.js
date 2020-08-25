import React, { useState } from 'react';
import styled from 'styled-components';
import T from 'prop-types';
import { Subheading } from '../../styles/type/heading';
import CardList, { CardWrapper } from '../common/card-list';
import { themeVal } from '../../styles/utils/general';
import FocusZone from './focus-zone';
import Dl from '../../styles/type/definition-list';
import { FormCheckable } from '../../styles/form/checkable';
import Button from '../../styles/button/button';

const CARD_DATA = [
  {
    id: 'AB',
    color: '#2c2a59',
    country: 'Zambia',
    energy_source: 'PVSolar',
    details: { zone_score: 0.782, total_lcoe: 145.3, generation: 39552 }
  },
  {
    id: 'CD',
    color: '#353d6d',
    country: 'Zambia',
    energy_source: 'PVSolar',
    details: { zone_score: 0.782, total_lcoe: 145.3, generation: 39552 }
  },
  {
    id: 'EF',
    color: '#4f5698',
    country: 'Zambia',
    energy_source: 'PVSolar',
    details: { zone_score: 0.782, total_lcoe: 145.3, generation: 39552 }
  }

];

const ZonesWrapper = styled.section`
  ol.list-container {
    padding: 0;
    gap: 0;
  }
  display: grid;
  grid-template-rows: auto 5fr;
`;

const ZonesHeader = styled(Subheading)`
  padding: 1rem 1.5rem;
`;

const Card = styled(CardWrapper)`
  display: flex;
  height: auto;
  box-shadow: none;
  border:none;
  border-bottom: 1px solid ${themeVal('color.baseAlphaC')};
  padding: 0.5rem 1.5rem;
  &:hover {
     box-shadow: none;
     transform: none;
     background: ${themeVal('color.baseAlphaB')};
   }
`;

const CardIcon = styled.div`
  background: ${({ color }) => `${color}`};
  width: 3rem;
  height: 3rem;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 1rem;
`;

const CardDetails = styled.ul`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
`;
const Detail = styled(Dl)`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  & ~ & {
    padding-top: 0.125rem;
  }

  dt,
  dd {
    margin: 0;
  }
  dt {
    font-size: 0.875rem;
  }
  dd {
    text-align: right;
    font-family: ${themeVal('type.mono.family')};
    color: ${themeVal('color.primary')};
  }
`;

function ExploreZones () {
  const [focusZone, setFocusZone] = useState(null);

  const [selectedZones, setSelectedZones] = useState({});

  return (
    <ZonesWrapper>
      <ZonesHeader>All Zones</ZonesHeader>

      { focusZone
        ? <FocusZone
          zone={focusZone}
          unFocus={() => setFocusZone(null)}
          selected={selectedZones[focusZone.id] || false}
          onSelect={() => setSelectedZones({ ...selectedZones, [focusZone.id]: !selectedZones[focusZone.id] })}
          /* eslint-disable-next-line */
        />
        : <>
          <CardList
            numColumns={1}
            data={CARD_DATA}
            renderCard={(data) => (
              <Card
                size='large'
                key={data.id}
                onClick={() => {
                  setFocusZone(data);
                }}
              >
                <CardIcon
                  color={data.color}
                >
                  <div>{data.id}</div>
                </CardIcon>
                <CardDetails>
                  {Object.entries(data.details).map(([label, data]) => (
                    <Detail key={`${data.id}-${label}`}>
                      <dt>{label.replace(/_/g, ' ')}</dt>
                      <dd>{data}</dd>
                    </Detail>
                  ))}
                </CardDetails>
                <FormCheckable
                  name={data.id}
                  id={data.id}
                  type='checkbox'
                  hideText
                  checked={selectedZones[data.id] || false}
                  onChange={(e) => {
                    setSelectedZones({ ...selectedZones, [data.id]: !selectedZones[data.id] });
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >Select {data.id}
                </FormCheckable>
              </Card>
            )}
          />
          <ExportZonesButton onExport={() => {}} />
          {/* eslint-disable-next-line */}
        </>}
    </ZonesWrapper>
  );
}
const ExportWrapper = styled.div`
  padding: 0.5rem;
  display: flex;
  justify-content: center;
`;

const ExportZonesButton = ({ onExport, small }) => {
  return (
    <ExportWrapper>
      <Button
        as='a'
        useIcon='download'
        variation='primary-raised-dark'
        size='small'
      >
        { small ? 'Export' : 'Export Selected Zones'}
      </Button>
    </ExportWrapper>

  );
};
ExportZonesButton.propTypes = {
  onExport: T.func,
  small: T.bool
};
export { ExportZonesButton };
export default ExploreZones;
