const likeSchema = {
	name: "like",
	nodeName: "PayLike",
	versions: [
		{
			version: 1,
			id: "2ae43eeb26d9",
			body: [
				{
					name: "likeTo",
					type: "string",
				},
				{
					name: "isLike",
					type: "string",
				},
			],
		},
	],
};

export default likeSchema;
