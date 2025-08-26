import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";


const prefix = '/device';

// Add a new device
const addDevice = async (formData) => {
    const response = await axios.post(`${prefix}/add-device`, formData);
    return response;
}
export const useAddDevice = () => {
    return useMutation({
        mutationFn: addDevice,
    });
}

//fetch Devices
const fetchDevices = async () => {
    const response = await axios.get(`${prefix}/get-device`);
     
    return response.data;
};

export const useFetchDevices = () => {
    return useQuery({
        queryKey: ['devices'],
        queryFn: fetchDevices,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}

// delete member
const deleteDevice = async (id) => {
    const response = await axios.delete(`${prefix}/delete-device`, {
      data:{ id }
    }
);
    return response;
};

export const useDeleteDevice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDevice,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['devices']);
            }
        }
    });
};

//fetching the device 
const fetchDeviceById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-deviceById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchDeviceById = (id) => {
    return useQuery({
        queryKey: ['deviceDetails', id],
        queryFn: fetchDeviceById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}

//update device 
const updateDevice = async (formData) => {
     formData.append('_method','PUT');
    const response = await axios.post(`${prefix}/update-device`, formData,);
    return response;
};

export const useUpdateDevice = () => {
    return useMutation({
        mutationFn: updateDevice,
    });
}


//fetch Devices
const fetchDevicesAttributes = async () => {
    const response = await axios.get(`${prefix}/device-attributes`);
     
    return response.data;
};

export const useFetchDevicesAttributes = () => {
    return useQuery({
        queryKey: ['devicesAttributes'],
        queryFn: fetchDevicesAttributes,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}


// Add a new device
const syncDevice = async (id) => {
    const response = await axios.post(`${prefix}/device-sync`,{
        id:id,
    });
    return response;
    // console.log(response);
    
}
export const useSyncDevice = () => {
    return useMutation({
        mutationFn: syncDevice,
    });
}