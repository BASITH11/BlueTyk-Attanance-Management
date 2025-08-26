import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";


const prefix = '/department';

// Add a new device
const addDepartment = async (formData) => {
    const response = await axios.post(`${prefix}/add-department`, formData);
    return response;
}
export const useAddDepartment = () => {
    return useMutation({
        mutationFn: addDepartment,
    });
}



//fetch all departments
const fetchDepartments = async () => {
    const response = await axios.get(`${prefix}/get-department`);

    return response.data;
};

export const useFetchDepartments = () => {
    return useQuery({
        queryKey: ['department'],
        queryFn: fetchDepartments,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,
    });
}

//delete device
// delete member
const deleteDepartment = async (id) => {
    const response = await axios.delete(`${prefix}/delete-department`, {
        data: { id }
    }
    );
    return response;
};

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: (response) => {
            if (response.status) {
                notify({
                    title: "Success",
                    message: response.message,
                    iconType: "success",
                });
                queryClient.invalidateQueries(['department']);
            }
        }
    });
};


//fetching the device 
const fetchDepartmentById = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-departmentById`, {
        params: { id }
    });
    return response.data;
};

export const useFetchDepartmentById = (id) => {
    return useQuery({
        queryKey: ['departmentDetails', id],
        queryFn: fetchDepartmentById,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}


//update department 
const updateDepartment = async (formData) => {
     formData.append('_method','PUT');
    const response = await axios.post(`${prefix}/update-department`, formData,);
    return response;
};

export const useUpdateDepartment = () => {
    return useMutation({
        mutationFn: updateDepartment,
    });
}