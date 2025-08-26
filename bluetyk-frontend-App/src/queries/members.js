import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

//add a new member
const prefix = '/members';

const addMember = async (formData) => {
    const response = await axios.post(`${prefix}/add-member`, formData,);
    return response;
};

export const useAddMember = () => {
    return useMutation({
        mutationFn: addMember
    });
}


//fetching the members  
const fetchMembers = async () => {
    const response = await axios.get(`${prefix}/get-members`);
    return response.data;
};

export const useFetchMembers = () => {
    return useQuery({
        queryKey: ['members'],
        queryFn: fetchMembers,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,

    });
}


// delete member
const deleteMember = async (id) => {
    const response = await axios.delete(`${prefix}/delete-member`, {
        data: { id }
    }
    );

    return response;
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMember,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['members']);
            }
        },
    });
};




//get member details
//fetching the members 
const fetchMemberById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-memberById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchMemberById = (id) => {
    return useQuery({
        queryKey: ['memberDetails', id],
        queryFn: fetchMemberById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}

//fet member image if have 

const fetchMemberImage = async ({ queryKey }) => {
    const [_key, image] = queryKey;

    const response = await axios.get(`${prefix}/get-member-image`, {
        params: { image },
        responseType: 'blob',
    });
    return response;
};

export const useFetchMemberImage = (image) => {
    return useQuery({
        queryKey: ['memberImage', image],
        queryFn: fetchMemberImage,
        enabled: !!image,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}

//update member

const updateMember = async (formData) => {
    formData.append('_method', 'PUT');
    const response = await axios.post(`${prefix}/update-member`, formData,);
    return response;
};

export const useUpdateMember = () => {
    return useMutation({
        mutationFn: updateMember
    });
}

//fetching the members  
const fetchEntryTypes = async () => {
    const response = await axios.get(`${prefix}/get-entryTypes`);
    return response.data;
};

export const useFetchEntryTypes = () => {
    return useQuery({
        queryKey: ['entryTypes'],
        queryFn: fetchEntryTypes,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,

    });
}


// delete member from linked device
const deleteMemberFromDevice = async ({ member_id, device_ids }) => {
    const response = await axios.delete(`${prefix}/delte-from-device/`, {
        data: { member_id, device_ids }
    }
    );

    return response;
};

export const useDeleteMemberFromDevice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMemberFromDevice,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['members']);
            }
        },
    });
};


//get unlinked devices 
const fetchUnlinkedDevice = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-unlinked-devices`, {
        params: { id }
    });
    return response.data;
};

export const useFetchUnlinkedDevice = (id) => {
    return useQuery({
        queryKey: ['unlinkedDevice', id],
        queryFn: fetchUnlinkedDevice,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}


//adding the member to device
const assignDevice = async (formData) => {
    const response = await axios.post(`${prefix}/assign-device`, formData,);
    return response;
};

export const useAssignDevice = () => {
    return useMutation({
        mutationFn: assignDevice
    });
}


//upload bulk members
const addBulkMember = async (formData) => {
    const response = await axios.post(`${prefix}/upload-members`, formData,);
    return response;
};

export const useAddBulkMember = () => {
    return useMutation({
        mutationFn: addBulkMember
    });
}