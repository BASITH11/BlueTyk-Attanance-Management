import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

const prefix = '/shift';



// Add a new device
const addShift = async (formData) => {
    const response = await axios.post(`${prefix}/add-shift`, formData);
    return response;
}
export const useAddShift = () => {
    return useMutation({
        mutationFn: addShift,
    });
}



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



const deleteShift = async (id) => {
    const response = await axios.delete(`${prefix}/delete-shift/`, {
        data: { id }
    }
    );
    return response;
};

export const useDeleteShift = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteShift,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['shifts']);
            }
        }
    });
};


//fetching the shift
const fetchShiftById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-shiftById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchShiftById = (id) => {
    return useQuery({
        queryKey: ['shiftDetails', id],
        queryFn: fetchShiftById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}


//update shift
const updateShift = async (formData) => {
    formData.append('_method', 'PUT');
    const response = await axios.post(`${prefix}/update-shift`, formData,);
    return response;
};

export const useUpdateShift = () => {
    return useMutation({
        mutationFn: updateShift,
    });
}
