import React, {useEffect, useState} from 'react';
import './App.scss';
import {JobsContainerComponent} from "./components/jobsContainerComponent";
import {FilterApi, JobFilter, JobFilterSubtypeEnum, JobFilterTypeEnum, ServiceStateApi} from "./api-clients";
import {configuration} from "./common/common-constants";
import {serviceStateService} from "./common/serviceState";
import {JobRequestsComponent} from "./components/jobRequestsComponent";
import {JobRepresentationComponent} from "./components/jobRepresentationComponent";
import {LocalSeekJob} from "./models/LocalSeekJob";
import {FilterComponent} from "./components/filterComponent";
import {SyncStateComponent} from "./components/syncState/syncStateComponent";

function App() {
    const [selectedJob, setSelectedJob] = useState<LocalSeekJob | undefined>(undefined);
    const [importantFilters, setImportantFilters] = useState<JobFilter[]>([]);
    const [ignoredFilters, setIgnoredFilters] = useState<JobFilter[]>([]);

    const selectJob = (job: LocalSeekJob | undefined) => {
        setSelectedJob(job);
    }

    const filterApiClient = new FilterApi(configuration);

    useEffect(() => {
        const stateApiClient = new ServiceStateApi(configuration);

        stateApiClient.serviceStateGet().then((state) => {
            serviceStateService.init(state);
        });

        filterApiClient.filterGetAllFiltersGet().then(filters => {
            const imFilters: JobFilter[] = [];
            const igFilters: JobFilter[] = [];

            filters.forEach(filter => {
                switch (filter.type) {
                    case JobFilterTypeEnum.Important:
                        imFilters.push(filter);
                        break;
                    case JobFilterTypeEnum.AutoIgnore:
                        igFilters.push(filter);
                        break;
                }
            })

            setImportantFilters(imFilters);
            setIgnoredFilters(igFilters);
        });
    },[]);

    const hideJobDetails = () => setSelectedJob(undefined);

    const addNewFilter = (text: string, type: JobFilterTypeEnum, subType: JobFilterSubtypeEnum) => {
        filterApiClient.filterAddFilterPost(text, type, subType).then(_ => {
            const newFilter = new JobFilter();
            newFilter.text = text;
            newFilter.type = type;
            newFilter.subtype = subType;

            switch(type) {
                case JobFilterTypeEnum.Important:
                    const imFilters = Object.assign([], importantFilters);
                    imFilters.push(newFilter);

                    setImportantFilters(imFilters);

                    break;
                case JobFilterTypeEnum.AutoIgnore:
                    const igFilters = Object.assign([], ignoredFilters);
                    igFilters.push(newFilter);

                    setIgnoredFilters(igFilters);

                    break;
            }
        });
    }



    return (
        <div className="App">
            <JobsContainerComponent
                selectJob={selectJob}
                selectedJobId={selectedJob?.id}
                hideJobDetails={hideJobDetails}
            />
            <div className="right-panel">
                <SyncStateComponent />
                <JobRepresentationComponent job={selectedJob} />
            </div>
            <div className="filter-panel component-card">
                <JobRequestsComponent />
                <FilterComponent
                    filters={importantFilters}
                    title="Important"
                    addNewFilter={addNewFilter}
                    type={JobFilterTypeEnum.Important}
                />
                <FilterComponent
                    filters={ignoredFilters}
                    title="Ignore"
                    addNewFilter={addNewFilter}
                    type={JobFilterTypeEnum.AutoIgnore}
                />
            </div>
        </div>
    );
}

export default App;
