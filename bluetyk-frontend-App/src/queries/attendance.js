import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";



const prefix = '/attendance';
//fetching the members  
const fetchAttendance = async ({ queryKey }) => {
    const [_key, filters] = queryKey;
    const response = await axios.get(`${prefix}/get-attendance`, {
        params: filters && Object.keys(filters).length > 0 ? filters : {}
    });
    return response.data;
};

export const useFetchAttendance = (filters = {}) => {
    return useQuery({
        queryKey: ['attendance', filters],
        queryFn: fetchAttendance,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};

const fetchMemberLog = async ({ queryKey }) => {
    const [_key, id] = queryKey;

    const response = await axios.get(`${prefix}/get-attendance-by-id`, {
        params: { id }
    });
    return response.data;
};

export const useFetchMemberLog = (id) => {
    return useQuery({
        queryKey: ['memberLog', id],
        queryFn: fetchMemberLog,
        enabled: !!id,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}





//fetching the members  
const fetchTodaysAttendance = async ({ queryKey }) => {
    const [_key, filters] = queryKey;
    const response = await axios.get(`${prefix}/get-todays-attendance`, {
        params: filters && Object.keys(filters).length > 0 ? filters : {}
    });
    return response.data;
};

export const useFetchTodaysAttendance = (filters = {}) => {
    return useQuery({
        queryKey: ['todaysAttendance', filters],
        queryFn: fetchTodaysAttendance,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};



//fetching the non-logged of today members  
const fetchTodaysAttendanceNonLogged = async ({ queryKey }) => {
    const [_key, filters] = queryKey;
    const response = await axios.get(`${prefix}/get-not-logged-today`, {
        params: filters && Object.keys(filters).length > 0 ? filters : {}
    });
    return response.data;
};

export const useFetchTodaysAttendanceNotLogged = (filters = {}) => {
    return useQuery({
        queryKey: ['todaysAttendanceNonLogged', filters],
        queryFn: fetchTodaysAttendanceNonLogged,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};