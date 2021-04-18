import { connect } from 'mongoose';

export = async (): Promise<Object> => {
	const databaseOptions = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: true,
		keepAlive: true,
	};

	return connect(`${process.env.MONGO_PASSWORD}`, databaseOptions);
};
