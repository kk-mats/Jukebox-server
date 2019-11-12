export const user = {
	uid: {
		minlength: 3,
		maxlength: 15,
		validate: /^[a-zA-Z\d](([a-zA-Z\d-]){0,14}[a-zA-Z\d])?$/
	},
	password: {
		minlength: 8,
		maxlength: 128,
		validate: /^.*(([A-Z].*[0-9])|([0-9].*[A-Z])).*$/
	}
};
