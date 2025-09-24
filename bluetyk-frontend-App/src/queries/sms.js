import axios from "axios";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@utils/helpers";

const prefix = '/sms';

// Add a new device
const SendSms = async (formData) => {
    const response = await axios.post(`${prefix}/sent-sms`, formData);
    return response;
}
export const useSendSms = () => {
    return useMutation({
        mutationFn: SendSms,
    });
}



// Add a new device
const SendSmsLogged = async () => {
    const response = await axios.post(`${prefix}/sent-sms-logged`);
    return response;
    // console.log(response);
}
export const useSendSmsLogged = () => {
    return useMutation({
        mutationFn: SendSmsLogged,
    });
}


//fetch sms logs
//fetching the members  
const fetchSmsLogs = async ({ queryKey }) => {
    const [_key, filters, page, perPage] = queryKey;
    const response = await axios.get(`${prefix}/get-sms-logs`, {
        params: { ...filters, page, per_page: perPage }
    });
    return response.data;
};

export const useFetchSmsLogs = ({ filters = {}, page = 1, perPage = 100 }) => {
    return useQuery({
        queryKey: ['smsLogs', filters, page, perPage],
        queryFn: fetchSmsLogs,
        keepPreviousData: true,
        cacheTime: 0,                 // Do not cache
        staleTime: 0,                 // Always considered stale
        refetchOnMount: true,        // Refetch on component mount
        refetchOnWindowFocus: true,  // Refetch when window regains focus
        refetchOnReconnect: true,

    });
}



export const DownloadSmsLogs = async ({ filters = {} }) => {
    try {
        // build params object
        const params = {
            ...filters,
            export: "excel",
        };

        const blob = await axios.get(`${prefix}/get-sms-logs`, {
            params,
            responseType: "blob",
            transformResponse: (r) => r,
        });

        const contentDisposition = blob.headers['content-disposition'];
        let fileName = 'smsLogs.xlsx';

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match && match[1]) {
                fileName = match[1];
            }
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =  fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download error:", error);
    }
};











