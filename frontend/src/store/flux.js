const getState = ({ getStore, getActions, setStore }) => {
	let backend = process.env.REACT_APP_FLASK_BACKEND_URL;
	return {
		store: {
			names: null,
		},
		actions: {
			getname: async (name) => {
				try {
					const resp = await fetch(`${backend}api/addname`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ name })
					});
					const data = await resp.json();
					setStore({ names: data.name });
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error);
				}
			},
		}
	};
};

export default getState;
