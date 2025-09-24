import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

const prefix = '/holiday';



// Add a new Holiday
const addHoliday = async (formData) => {
    const response = await axios.post(`${prefix}/add-holiday`, formData);
    return response;
}
export const useAddHoliday = () => {
    return useMutation({
        mutationFn: addHoliday,
    });
}




//fetch holidays
const fetchHolidays = async ({ page = 1, perPage = 100 }) => {
    const response = await axios.get(`${prefix}/get-holiday`, {
        params: { page, per_page: perPage }
    });

    return response.data;
};

export const useFetchHolidays = ({ page = 1, perPage = 100 }) => {
    return useQuery({
        queryKey: ['holidays'],
        queryFn: () => fetchHolidays({ page, perPage }),
        keepPreviousData: true,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}


// delete member
const deleteHoliday = async (id) => {
    const response = await axios.delete(`${prefix}/delete-holiday`, {
        data: { id }
    }
    );
    return response;
};

export const useDeleteHoliday = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteHoliday,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['holidays']);
            }
        }
    });
};



//fetching the holiday 
const fetchHolidayById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-holidayById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchHolidayById = (id) => {
    return useQuery({
        queryKey: ['holidayDetails', id],
        queryFn: fetchHolidayById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}


//update holiday 
const updateHoliday = async (formData) => {
    formData.append('_method', 'PUT');
    const response = await axios.post(`${prefix}/update-holiday`, formData,);
    return response;
};

export const useUpdateHoliday = () => {
    return useMutation({
        mutationFn: updateHoliday,
    });
}