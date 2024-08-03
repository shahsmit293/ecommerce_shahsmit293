import React, { useContext, useEffect, useState } from 'react';
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  ChannelList,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { Context } from '../store/appContext';

const Inbox = () => {
  const { store } = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const initializeChatClient = async () => {
      if (store.chatClient) {
        setTimeout(() => {
          setLoading(false);
          setShowChat(true);
        }, 8000);
      }
    };

    initializeChatClient();
  }, [store.activeuserid]);

  if (loading) {
    return <div>Setting up client & connection...</div>;
  }

  const filters = { type: 'messaging', members: { $in: [String(store.activeuserid)] } };
  const sort = { last_message_at: -1 };
  const options = { state: true, watch: true, presence: true };

  return showChat ? (
    <Chat client={store.chatClient} theme="team light">
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  ) : (
    <div>Initializing chat...</div>
  );
};

export default Inbox;
