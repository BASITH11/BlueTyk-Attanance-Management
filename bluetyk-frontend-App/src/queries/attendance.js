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
    const [_key, memberId, page, perPage] = queryKey;

    const response = await axios.get(`${prefix}/get-attendance-by-id`, {
        params: { id: memberId, page, per_page: perPage }
    });
    return response.data;
};

export const useFetchMemberLog = ({ memberId, page, perPage }) => {
    return useQuery({
        queryKey: ['memberLog', memberId, page, perPage],
        queryFn: fetchMemberLog,
        enabled: !!memberId,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

    });
}





//fetching the attendances 
const fetchTodaysAttendance = async ({ queryKey }) => {
    const [_key, filters, page, perPage] = queryKey;
    const response = await axios.get(`${prefix}/get-todays-attendance`, {
        params: { ...filters, page, per_page: perPage }
    });
    return response.data;
};

export const useFetchTodaysAttendance = ({ filters = {}, page = 1, perPage = 100, }) => {
    return useQuery({
        queryKey: ['todaysAttendance', filters, page, perPage],
        queryFn: fetchTodaysAttendance,
        keepPreviousData: true,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};



//fetching the non-logged of today members  
const fetchTodaysAttendanceNonLogged = async ({ queryKey }) => {
    const [_key, filters, page, perPage] = queryKey;
    const response = await axios.get(`${prefix}/get-not-logged-today`, {
        params: { ...filters, page, per_page: perPage }
    });
    return response.data;
};

export const useFetchTodaysAttendanceNotLogged = ({ filters = {}, page = 1, perPage = 100, }) => {
    return useQuery({
        queryKey: ['todaysAttendanceNonLogged', filters, page, perPage],
        queryFn: fetchTodaysAttendanceNonLogged,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true
    });
};


export const downloadAttendance = async () => {
    try {
        const blob = await axios.get(`${prefix}/download-attendance`, {
            responseType: "blob",
            transformResponse: (r) => r, 
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Attendance_${new Date().toISOString().slice(0, 10)}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download error:", error);
    }
};



