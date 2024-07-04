import React, { useEffect, useContext, useState } from 'react';
import { Chat, Channel, ChannelHeader, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import { Context } from '../store/appContext';

const DirectChat = ({ sellerEmail }) => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        const fetchUserAndToken = async () => {
            await actions.getStreamToken(store.user.username); // Fetch the token if not already fetched
            const chatClient = store.chatClient;

            if (chatClient) {
                // Ensure the chat client is connected
                const userId = store.user.username;
                const sellerId = sellerEmail;

                const channel = chatClient.channel('messaging', {
                    members: [userId, sellerId]
                });
                await channel.watch();

                setChannel(channel);
                setLoading(false);
            }
        };

        fetchUserAndToken();
    }, [actions, store.user.username, store.chatClient, sellerEmail]);

    if (loading || !channel) {
        return <div>Setting up client & connection...</div>;
    }

    return (
        <Chat client={store.chatClient}>
            <Channel channel={channel}>
                <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                </Window>
                <Thread />
            </Channel>
        </Chat>
    );
};

export default DirectChat;
