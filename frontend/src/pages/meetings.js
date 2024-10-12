import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import '../styles/meetings.css'; // Import the CSS file for table styles

const Meetings = () => {
    const zoomclientid = process.env.REACT_APP_ZOOM_CLIENT_ID;
    const backendurl = process.env.REACT_APP_FLASK_BACKEND_URL;
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [participantEmails, setParticipantEmails] = useState({});
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [zoomTokenAvailable, setZoomTokenAvailable] = useState(false);

    if (!store.token) {
        return (
          <div>
            Please log in to view this page.
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        );
      }

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
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="meetings-container">
            <h1 className="meetings-page-title">Meetings Page</h1>
            {store.subscribed ? (
                <>
                    <p className="meetings-subscription-status">You are already subscribed!</p>
                    {zoomTokenAvailable ? (
                        <>
                            <button className="meetings-action-button" onClick={handleCreateMeeting}>Create Meeting</button>
                            {errors.general && <p className="error-message">{errors.general}</p>}
                        </>
                    ) : (
                        <button className="meetings-action-button" onClick={handleAuthorizeZoom}>Authorize Zoom</button>
                    )}

                    {store.allmeetings && store.allmeetings.length > 0 ? (
                        <table className="meetings-table">
                            <thead>
                                <tr>
                                    <th>Meeting ID</th>
                                    <th>Participant Email</th>
                                    <th>Meeting Link</th>
                                    <th>Host URL</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {store.allmeetings.map((meeting) => (
                                    <tr key={meeting.meeting_id}>
                                        <td>{meeting.meeting_id}</td>
                                        <td>
                                            {meeting.participant_email ? (
                                                <span>{meeting.participant_email}</span>
                                            ) : (
                                                <>
                                                    <input
                                                        type="email"
                                                        value={participantEmails[meeting.meeting_id] || ""}
                                                        onChange={(event) => handleParticipantEmailChange(meeting.meeting_id, event)}
                                                        placeholder="Enter participant email"
                                                        className="meetings-email-input"
                                                    />
                                                    {errors[meeting.meeting_id] && (
                                                        <p className="meetings-error-message">{errors[meeting.meeting_id]}</p>
                                                    )}
                                                    <button
                                                        className="meetings-add-participant-button"
                                                        onClick={() => {
                                                            setSelectedMeetingId(meeting.meeting_id);
                                                            handleSubmitParticipantEmail(meeting.meeting_id);
                                                        }}
                                                    >
                                                        Add Participant
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            {meeting.meeting_link ? (
                                                <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                                    {meeting.meeting_link}
                                                </a>
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            {meeting.host_url ? (
                                                <a href={meeting.host_url} target="_blank" rel="noopener noreferrer">
                                                    {meeting.host_url}
                                                </a>
                                            ) : (
                                                <span>N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="meetings-delete-button" onClick={() => handleDeleteMeeting(meeting.meeting_id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="meetings-no-meetings">No meetings available.</p>
                    )}
                </>
            ) : (
                <>
                    <p className="subscription-status">You are not subscribed. Click below to subscribe:</p>
                    <button className="action-button" onClick={handleSubscription}>Add Subscription</button>
                </>
            )}
        </div>
    );
};

export default Meetings;
