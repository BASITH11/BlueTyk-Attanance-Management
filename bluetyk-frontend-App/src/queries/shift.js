import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

const prefix = '/shift';


//fetch users
const fetchShift = async ({ page = 1, perPage = 100 }) => {
    const response = await axios.get(`${prefix}/get-shift`, {
        params: { page, per_page: perPage }
    });

    return response.data;
};

export const useFetchShift = ({ page = 1, perPage = 100 }) => {
    return useQuery({
        queryKey: ['shifts'],
        queryFn: () => fetchShift({ page, perPage }),
        keepPreviousData: true,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}

