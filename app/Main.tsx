/* eslint-disable prettier/prettier */
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { View } from 'react-native';
import { Card, Dialog } from 'react-native-elements';
import React from 'react';
import { accelerometer, gravity, gyroscope, orientation } from 'react-native-sensors';
import Geolocation from '@react-native-community/geolocation';
import CompassHeading from 'react-native-compass-heading';
enum State {
    Loading,
    Loaded,
    Error,
}

const MainView: React.FC<{}> = () => {
    const params = useRoute().params as { serverURL: string };
    const serverURL = params.serverURL;


    const nav = useNavigation();
    const [errorMessage, setErrorMessage] = useState('');
    const [state, setState] = useState(State.Loading);
    const [wsClient, setWsClient] = useState<WebSocket | null>(null);
    useEffect(() => {
        (async () => {
            const client = axios.create({
                baseURL: serverURL,
                timeout: 5000,
            });
            try {
                const res = await client.get('/api/echo', { params: { text: 'hello' } });
                if ((res.data as { text: string }).text !== 'hello') {
                    throw new Error('echo failed');
                }
                setState(State.Loaded);
            } catch (e) {
                console.log(e);
                setState(State.Error);
                setErrorMessage(String(e));
            }
        }
        )();
    }, [serverURL]);
    useEffect(() => {
        if (state === State.Loaded) {
            // Now we can create WebSocket connection
            const ws = new WebSocket(serverURL.replace('http', 'ws') + '/api/upload');
            ws.onerror = (e) => {
                console.log(e);
                setState(State.Error);
                setErrorMessage(e.message);
            };
            ws.onclose = (e) => {
                console.log(e);
                if (e.code && e.code > 1001) {
                    setState(State.Error);
                    setErrorMessage(`连接关闭: code=${e.code}, reason=${e.reason}, message=${e.message}`);
                }
            };

            setWsClient(ws);
            return () => ws.close();
        }
    }, [state, serverURL]);
    const sendData = useCallback((data: any) => {
        if (wsClient && wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify(data));
        }
    }, [wsClient]);
    useEffect(() => {
        if (state === State.Loaded) {
            const sub = accelerometer.subscribe(v => {
                sendData({
                    Accelerometer: v,
                });
            });
            return () => {
                sub.unsubscribe();
            };
        }
    }, [sendData, state]);

    useEffect(() => {
        if (state === State.Loaded) {
            const sub = gyroscope.subscribe(v => {
                sendData({
                    Gyroscope: v,
                });
            });
            return () => {
                sub.unsubscribe();
            };
        }
    }, [sendData, state]);
    useEffect(() => {
        if (state === State.Loaded) {
            const sub = orientation.subscribe(v => {
                sendData({
                    Orientation: v,
                });
            });
            return () => {
                sub.unsubscribe();
            };
        }
    }, [sendData, state]);

    useEffect(() => {
        if (state === State.Loaded) {
            const sub = gravity.subscribe(v => {
                sendData({
                    Gravity: v,
                });
            });
            return () => {
                sub.unsubscribe();
            };
        }

    }, [sendData, state]);
    useEffect(() => {
        if (state === State.Loaded) {
            CompassHeading.start(3, (heading) => {
                sendData({
                    Compass: heading,
                });
            });
            return () => CompassHeading.stop();
        }
    }, [sendData, state]);
    useEffect(() => {
        if (state === State.Loaded) {
            console.log('Watching position...');
            const handle = Geolocation.watchPosition(resp => {
                sendData({
                    Geolocation: resp,
                });
            }, err => {
                console.log(err);
                setErrorMessage(`无法获取位置: ${err.message}, code=${err.code}`);
                setState(State.Error);
            });

            return () => Geolocation.clearWatch(handle);

        }
    }, [sendData, state]);
    return <View>
        <Dialog isVisible={state === State.Loading}>
            <Dialog.Loading />
        </Dialog>
        <Dialog isVisible={state === State.Error}>
            <Dialog.Title title="发生错误" />
            <Text>{errorMessage}</Text>
            <Dialog.Actions>
                <Dialog.Button title="返回" onPress={() => nav.goBack()} />
            </Dialog.Actions>
        </Dialog>
        {state === State.Loaded && <>
            <Card>
                <Card.Title>
                    正在上传数据
                </Card.Title>
                <Card.Divider />
                <Text>
                    服务端地址: {serverURL}
                </Text>
            </Card>
        </>}
    </View>;
};

export default MainView;
