import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";

const Meetings = () => {
    const zoomclientid = process.env.REACT_APP_ZOOM_CLIENT_ID;
    console.log("Zoom Client ID:", zoomclientid);
    const backendurl = process.env.REACT_APP_FLASK_BACKEND_URL;
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [participantEmails, setParticipantEmails] = useState({});
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [zoomTokenAvailable, setZoomTokenAvailable] = useState(false);

    useEffect(() => {
        const zoomToken = sessionStorage.getItem("zoomtoken");
        const queryParams = new URLSearchParams(window.location.search);
        const zoomAccessToken = queryParams.get('zoom_access_token');

        if (zoomAccessToken) {
            // Store the token in session storage
            sessionStorage.setItem('zoomtoken', zoomAccessToken);
            // Redirect to remove the token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            const storedToken = sessionStorage.getItem('zoomtoken');
            if (storedToken) {
                setZoomTokenAvailable(true);
            } else {
                setZoomTokenAvailable(false);
            }
        }

        if (!store.user || !store.user.email) {
            return;
        }

        const fetchSubscription = async () => {
            setLoading(true);
            try {
                await actions.getSubscribed(store.user.email);
                await actions.getMeetings(store.user.email);
            } catch (error) {
                console.error("Failed to fetch subscription status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [store.user]);

    const handleSubscription = async () => {
        try {
            if (store.user && store.user.email) {
                await actions.addSubscribe(store.user.email);
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to subscribe:", error);
        }
    };

    const handleCreateMeeting = async () => {
        try {
            if (store.user && store.user.email) {
                await actions.createMeeting(store.user.email);
                await actions.getMeetings(store.user.email);
            }
        } catch (error) {
            console.error("Failed to create meeting:", error);
            
            // Set the error message to show on the frontend
            setErrors({ general: error.message });

            // Clear the error message after 5 seconds
            setTimeout(() => {
                setErrors({ general: null });
            }, 5000);
        }
    };

    const handleAuthorizeZoom = () => {
        // Redirect to Zoom OAuth authorization URL
        window.location.href = `https://zoom.us/oauth/authorize?response_type=code&client_id=${zoomclientid}&redirect_uri=${backendurl}zoom/callback`;
    };

    const handleParticipantEmailChange = (meetingId, event) => {
        setParticipantEmails({
            ...participantEmails,
            [meetingId]: event.target.value
        });
        setErrors({ ...errors, [meetingId]: null });
    };

    const handleSubmitParticipantEmail = async (meetingId) => {
        const participantEmail = participantEmails[meetingId];
        try {
            if (meetingId && participantEmail) {
                const result = await actions.addParticipant(meetingId, participantEmail);
                if (result.error) {
                    setErrors({ ...errors, [meetingId]: result.error });
                } else {
                    await actions.getMeetings(store.user.email);
                }
            }
        } catch (error) {
            console.error("Failed to add participant:", error);
        }
    };

    // Delete a meeting by meeting_id
    const handleDeleteMeeting = async (meetingId) => {
        try {
            await actions.deleteMeeting(meetingId);
            await actions.getMeetings(store.user.email);
        } catch (error) {
            console.error("Failed to delete meeting:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Meetings Page</h1>
            {store.subscribed ? (
                <>
                    <p>You are already subscribed!</p>
                    {zoomTokenAvailable ? (
                        <>
                            <button onClick={handleCreateMeeting}>Create Meeting</button>
                            {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
                        </>
                    ) : (
                        <button onClick={handleAuthorizeZoom}>Authorize Zoom</button>
                    )}

                    {store.allmeetings && store.allmeetings.length > 0 ? (
                        <ul>
                            {store.allmeetings.map((meeting) => (
                                <li key={meeting.meeting_id}>
                                    <p>Meeting ID: {meeting.meeting_id}</p>
                                    {meeting.participant_email ? (
                                        <>
                                            <p>Participant Email: {meeting.participant_email}</p>
                                            <p>
                                                Meeting Link:{" "}
                                                <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                                    {meeting.meeting_link}
                                                </a>
                                            </p>
                                            <p>
                                                Host URL:{" "}
                                                <a href={meeting.host_url} target="_blank" rel="noopener noreferrer">
                                                    {meeting.host_url}
                                                </a>
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="email"
                                                value={participantEmails[meeting.meeting_id] || ""}
                                                onChange={(event) => handleParticipantEmailChange(meeting.meeting_id, event)}
                                                placeholder="Enter participant email"
                                            />
                                            {errors[meeting.meeting_id] && (
                                                <p style={{ color: "red" }}>{errors[meeting.meeting_id]}</p>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedMeetingId(meeting.meeting_id);
                                                    handleSubmitParticipantEmail(meeting.meeting_id);
                                                }}
                                            >
                                                Add Participant
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => handleDeleteMeeting(meeting.meeting_id)}>
                                        Delete Meeting
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No meetings available.</p>
                    )}
                </>
            ) : (
                <>
                    <p>You are not subscribed. Click below to subscribe:</p>
                    <button onClick={handleSubscription}>Add Subscription</button>
                </>
            )}
        </div>
    );
};

export default Meetings;
