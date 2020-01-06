export const user = {
	accountId: {
		minlength: 3,
		maxlength: 15,
		validator: /^[a-zA-Z\d](([a-zA-Z\d-]){0,14}[a-zA-Z\d])?$/
	},
	password: {
		minlength: 8,
		maxlength: 128,
		validator: /^.*(([A-Z].*[0-9])|([0-9].*[A-Z])).*$/
	}
};
