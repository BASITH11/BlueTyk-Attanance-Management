import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";


const prefix = '/location';

// Add a new device
const addLocation = async (formData) => {
    const response = await axios.post(`${prefix}/add-location`, formData);
    return response;
}
export const useAddLocation = () => {
    return useMutation({
        mutationFn: addLocation,
    });
}



//fetch all locations
const fetchLocations = async () => {
    const response = await axios.get(`${prefix}/get-location`);

    return response.data;
};

export const useFetchLocations = () => {
    return useQuery({
        queryKey: ['location'],
        queryFn: fetchLocations,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}

//delete device
// delete member
const deleteLocation = async (id) => {
    const response = await axios.delete(`${prefix}/delete-location/`, {
        data: { id }
    }
    );
    return response;
};

export const useDeleteLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteLocation,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['location']);
            }
        }
    });
};


//fetching the device 
const fetchLocationById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-locationById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchLocationById = (id) => {
    return useQuery({
        queryKey: ['LocationDetails', id],
        queryFn: fetchLocationById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}


//update location 
const updateLocation = async (formData) => {
     formData.append('_method','PUT');
    const response = await axios.post(`${prefix}/update-location`, formData,);
    return response;
};

export const useUpdateLocation = () => {
    return useMutation({
        mutationFn: updateLocation,
    });
}