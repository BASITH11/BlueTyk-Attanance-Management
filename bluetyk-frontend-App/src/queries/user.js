import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

const prefix = '/user';

// Add a new device
const addUser = async (formData) => {
    const response = await axios.post(`${prefix}/add-user`, formData);
    return response;
}
export const useAddUser = () => {
    return useMutation({
        mutationFn: addUser,
    });
}


//fetch usertype
const fetchUserAttributes = async () => {
    const response = await axios.get(`${prefix}/get-usertype`);

    return response.data;
};

export const useFetchUserAttributes = () => {
    return useQuery({
        queryKey: ['userAttributes'],
        queryFn: fetchUserAttributes,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}


//fetch users
const fetchUsers = async () => {
    const response = await axios.get(`${prefix}/get-users`);

    return response.data;
};

export const useFetchUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}

// delete user
const deleteUser = async (id) => {
    const response = await axios.delete(`${prefix}/delete-user/`, {
        data: { id }
    }
    );
    return response;
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['users']);
            }
        }
    });
};

//fetching the device 
const fetchUserById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-userById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchUserById = (id) => {
    return useQuery({
        queryKey: ['userDetails', id],
        queryFn: fetchUserById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}


//updating the user

//update device 
const updateUser = async (formData) => {
    formData.append('_method', 'PUT');
    const response = await axios.post(`${prefix}/user-update`, formData,);
    return response;
};

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: updateUser,
    });
}