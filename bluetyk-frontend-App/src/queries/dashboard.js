import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

const prefix = '/dashboard';

//fetch Devices
const fetchDashboardDetails = async () => {
    const response = await axios.get(`${prefix}/dashboard-details`);
     
    return response.data;
};

export const useFetchDashboardDetails = () => {
    return useQuery({
        queryKey: ['dashboardDetails'],
        queryFn: fetchDashboardDetails,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}