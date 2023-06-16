import React, { useContext, createContext, useReducer, useEffect, useState } from 'react';
import T from 'prop-types';
import { fetchFilterRanges, filterRangesReducer } from './reducers/filter-ranges';
import { fetchFilters, filtersReducer } from './reducers/filters';
import { fetchWeights, weightsReducer } from './reducers/weights';
import { fetchLcoe, lcoeReducer } from './reducers/lcoe';
import ExploreContext from './explore-context';
import { initialApiRequestState } from './contexeed';
import {
  hideGlobalLoading
} from '../components/common/global-loading';
import { apiResourceNameMap } from '../components/explore/panel-data';
import { RESOURCES } from '../components/explore/panel-data';

const FormContext = createContext({});

export function FormProvider (props) {
  const { selectedAreaId, selectedResource, selectedZoneType, currentZones } = useContext(ExploreContext);
  const [inputTouched, setInputTouched] = useState(true);
  const [zonesGenerated, setZonesGenerated] = useState(false);
  const [importedFilters, setImportedFilters] = useState(null);

  const [showSelectAreaModal, setShowSelectAreaModal] = useState(
    !selectedAreaId
  );
  const [showSelectResourceModal, setShowSelectResourceModal] = useState(
    !selectedResource
  );
  const [showSelectZoneTypeModal, setShowSelectZoneTypeModal] = useState(
    !selectedZoneType
  );

  const [filtersList, dispatchFiltersList] = useReducer(
    filtersReducer,
    initialApiRequestState
  );
  const [filterRanges, dispatchFilterRanges] = useReducer(
    filterRangesReducer,
    initialApiRequestState
  );

  const [weightsList, dispatchWeightsList] = useReducer(
    weightsReducer,
    initialApiRequestState
  );

  const [lcoeList, dispatchLcoeList] = useReducer(
    lcoeReducer,
    initialApiRequestState
  );

  // this is lazy programming for fire off the filters fetch once
  let ff = false;

  // Show modals based on selection
  useEffect(() => {
    setShowSelectAreaModal(!selectedAreaId);
    setShowSelectResourceModal(!selectedResource);
    setShowSelectZoneTypeModal(!selectedZoneType);

    if (selectedAreaId && selectedResource && selectedZoneType) {
      // only fetch filters once, after we have resources
      if (!ff) {
        fetchFilters(selectedResource, dispatchFiltersList);
        ff = true;
      }

      fetchFilterRanges(selectedAreaId, selectedResource, dispatchFilterRanges);
    }
  }, [selectedAreaId, selectedResource, selectedZoneType]);

  useEffect(() => {
    fetchWeights(dispatchWeightsList);
  }, []);

  useEffect(() => {
    fetchLcoe(selectedAreaId, apiResourceNameMap[selectedResource], dispatchLcoeList);
  }, [selectedAreaId, selectedResource]);

  useEffect(() => {
    if (currentZones.fetched) {
      hideGlobalLoading();
      !zonesGenerated && setZonesGenerated(true);
      setInputTouched(false);
    }
  }, [currentZones]);
  return (
    <>
      <FormContext.Provider
        value={
          {
            filtersListReducerRes: filtersList,
            filtersLists: filtersList.isReady() ? filtersList.getData() : null,
            weightsList: weightsList.isReady() ? weightsList.getData() : null,
            lcoeList: lcoeList.isReady() ? lcoeList.getData() : null,
            filterRanges: filterRanges.isReady() ? filterRanges.getData() : null,
            inputTouched,
            setInputTouched,
            zonesGenerated,
            setZonesGenerated,
            showSelectAreaModal,
            setShowSelectAreaModal,
            showSelectResourceModal, setShowSelectResourceModal,
            showSelectZoneTypeModal, setShowSelectZoneTypeModal,
            importedFilters, setImportedFilters
          }
        }
      >
        {props.children}
      </FormContext.Provider>
    </>
  );
}

FormProvider.propTypes = {
  children: T.node
};

export default FormContext;
