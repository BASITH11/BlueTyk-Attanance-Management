import {
    Anchor,
    Box,
    Image,
    Text
} from "@mantine/core";
import logo from "../../assets/images/bluewhyte_logo.png"

export default function Footer() {
    return (
        <Box className="w-full md:w-[90%] flex justify-between items-center min-h-18 border-t-3 border-[var(--app-primary-color)]" px="sm">
            <Image src={logo} radius="sm" h={50} w="auto" fit="contain" />

            <Box px="sm" className="text-right ">
                <Text className="text-xs md:text-sm"> {new Date().getFullYear()} BlueWhyte. All rights reserved</Text>
                <Anchor href="#" className="text-indigo-900 hover:underline" underline="never">
                    <Text className="text-xs md:text-sm">www.BlueWhyte.com</Text>
                </Anchor>
            </Box>
       </Box>
 )
}