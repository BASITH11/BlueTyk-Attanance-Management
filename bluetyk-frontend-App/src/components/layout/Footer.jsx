import {
    Anchor,
    Box,
    Image,
    Text
} from "@mantine/core";
import logo from "../../assets/images/logo.png"

export default function Footer() {
    return (
        <Box className="w-full md:w-[90%] flex justify-between items-center min-h-18 border-t-3 border-[var(--app-primary-color)]" px="sm">
            <Image src={logo} radius="sm" h={90} w="auto" fit="cover"  />

            <Box px="sm" className="text-right ">
                <Text className="text-xs md:text-sm"> {new Date().getFullYear()} BlueTyk. All rights reserved</Text>
                <Anchor href="#" className="text-indigo-900 hover:underline" underline="never">
                    <Text className="text-xs md:text-sm">www.BlueTyk.com</Text>
                </Anchor>
            </Box>
       </Box>
 )
}