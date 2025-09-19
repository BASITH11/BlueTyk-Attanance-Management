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










