// import React, { useEffect, useContext, useState } from 'react';
// import { Chat, Channel, ChannelHeader, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
// import 'stream-chat-react/dist/css/v2/index.css';
// import { Context } from '../store/appContext';
// import { StreamChat } from 'stream-chat';

// const Chatting = () => {
//     const { store, actions } = useContext(Context);
//     const [loading, setLoading] = useState(true);
//     const [selectedChannelId, setSelectedChannelId] = useState(store.channelId);
//     const apiKey = process.env.REACT_APP_STREAM_API_KEY;

//     useEffect(() => {
//         const initializeChatClient = async () => {
//             if (store.chatClient) {
//                 setLoading(false);
//             }
//         };

//         initializeChatClient();
//     }, [store.token, store.activeuserid, store.streamToken]);

//     const handleChannelClick = (channelId) => {
//         setSelectedChannelId(channelId);
//     };

//     if (loading || !store.chatClient) {
//         return <div>Setting up client & connection...</div>;
//     }

//     return (
//         <div style={{ display: 'flex' }}>
//             <div style={{ width: '25%', borderRight: '1px solid #ddd', padding: '10px' }}>
//                 <h3>Channels</h3>
//                 <ul>
//                     {store.channelslist.map((channelId) => (
//                         <li key={channelId} onClick={() => handleChannelClick(channelId)}>
//                             {channelId}
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//             <div style={{ width: '75%' }}>
//                 {selectedChannelId ? (
//                     <Chat client={store.chatClient} theme="messaging light">
//                         <Channel channel={store.chatClient.channel('messaging', selectedChannelId)}>
//                             <Window>
//                                 <ChannelHeader />
//                                 <MessageList />
//                                 <MessageInput />
//                             </Window>
//                             <Thread />
//                         </Channel>
//                     </Chat>
//                 ) : (
//                     <div>Select a channel to start chatting</div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Chatting;
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

const PersonalChat = () => {
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

  if (loading || !store.chatClient || !store.channel) {
    return <div>Setting up client & connection...</div>;
  }

  const filters = { id: store.channel.id };
  const sort = { last_message_at: -1 };
  const options = { state: true, watch: true, presence: true };

  return (
    <Chat client={store.chatClient} theme="team light">
      <ChannelList filters={filters} sort={sort} options={options} />
      <Channel channel={store.chatClient.channel('messaging', store.channel.id)}>
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

export default PersonalChat;

