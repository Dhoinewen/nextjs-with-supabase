import { FC } from 'react';

type LoaderProps = {
    text?: string;
};

const Loader: FC<LoaderProps> = ({ text = 'Loading...' }) => (
    <div className="flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{text}</p>
        </div>
    </div>
);

export default Loader;
