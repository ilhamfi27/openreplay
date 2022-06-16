import React, { useEffect, useState } from 'react';
import { useStore } from 'App/mstore';
import { useObserver } from 'mobx-react-lite';
import { NoContent, Loader } from 'UI';
import FunnelIssuesDropdown from '../FunnelIssuesDropdown';
import FunnelIssuesSort from '../FunnelIssuesSort';
import FunnelIssuesList from '../FunnelIssuesList';
import { DateTime } from 'luxon';
import { debounce } from 'App/utils';
import useIsMounted from 'App/hooks/useIsMounted';
import AnimatedSVG, { ICONS } from 'Shared/AnimatedSVG/AnimatedSVG';

function FunnelIssues() {
    const { metricStore, dashboardStore } = useStore();
    const [data, setData] = useState<any>({ issues: [] });
    const [loading, setLoading] = useState(false);
    const isMounted = useIsMounted()
    // const funnel = useObserver(() => funnelStore.instance);
    // const funnel = useObserver(() => metricStore.instance);
    // const issues = useObserver(() => funnelStore.issues);
    // const loading = useObserver(() => funnelStore.isLoadingIssues);

    const fetchIssues = (filter: any) => {
        if (!isMounted()) return;
        setLoading(true)
        widget.fetchIssues(filter).then((res: any) => {
            setData(res)
        }).finally(() => {
            setLoading(false)
        });
    }

    const filter = useObserver(() => dashboardStore.drillDownFilter);
    const widget: any = useObserver(() => metricStore.instance);
    const startTime = DateTime.fromMillis(filter.startTimestamp).toFormat('LLL dd, yyyy HH:mm a');
    const endTime = DateTime.fromMillis(filter.endTimestamp).toFormat('LLL dd, yyyy HH:mm a');
    const debounceRequest: any = React.useCallback(debounce(fetchIssues, 1000), []);
    

    const depsString = JSON.stringify(widget.series);
    useEffect(() => {
        debounceRequest({ ...filter, series: widget.toJsonDrilldown(), page: metricStore.sessionsPage, limit: metricStore.sessionsPageSize });
    }, [filter.startTimestamp, filter.endTimestamp, filter.filters, depsString, metricStore.sessionsPage]);

    return useObserver(() => (
        <div className="my-8">
            <div className="flex justify-between">
                <h1 className="font-medium text-2xl">Most significant issues <span className="font-normal">identified in this funnel</span></h1>
            </div>
            <div className="my-6 flex justify-between items-start">
                <FunnelIssuesDropdown />
                <div className="flex-shrink-0">
                    <FunnelIssuesSort />
                </div>
            </div>
            <Loader loading={loading}>
                <NoContent
                    show={!loading && data.issues.length === 0}
                    title={
                        <div className="flex flex-col items-center justify-center">
                            <AnimatedSVG name={ICONS.NO_RESULTS} size="170" />
                            <div className="mt-6 text-2xl">No issues found</div>
                        </div>
                    }
                >
                    <FunnelIssuesList issues={data.issues} />
                </NoContent>
            </Loader>
        </div>
    ));
}

export default FunnelIssues;