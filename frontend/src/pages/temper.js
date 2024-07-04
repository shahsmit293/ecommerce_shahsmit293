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
  useChatContext
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';
import { Context } from '../store/appContext';

const Temper = () => {
  const { store } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeChatClient = async () => {
      if (store.chatClient) {
        setLoading(false);
      }
    };

    initializeChatClient();
  }, [store]);

  if (loading || !store.chatClient) {
    return <div>Setting up client & connection...</div>;
  }

  const filters = { type: 'messaging', members: { $in: [String(store.activeuserid)] } };
  const sort = { last_message_at: -1 };
  const options = { state: true, watch: true, presence: true };

  return (
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
  );
};

export default Temper;
