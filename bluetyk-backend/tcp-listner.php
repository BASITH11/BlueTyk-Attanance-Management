<?php
$ip = '0.0.0.0';
$port = 8081; // Make sure this matches the port set in your device

$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
if (!$socket) {
    die(" Could not create socket\n");
}
if (!socket_bind($socket, $ip, $port)) {
    die(" Could not bind to port $port\n");
}
socket_listen($socket);
echo " Listening on $ip:$port...\n";

while (true) {
    $client = socket_accept($socket);
    $input = socket_read($client, 2048);
    $log = "[" . date("Y-m-d H:i:s") . "] ?? Device sent: " . trim($input) . "\n";
    file_put_contents("device_raw_log.txt", $log, FILE_APPEND);
    echo $log;

    // Send response (if needed)
    socket_write($client, "OK\n");
    socket_close($client);
}
