import { FC } from 'react';

type FullScreenLoaderProps = {
    text?: string;
};

const FullScreenLoader: FC<FullScreenLoaderProps> = ({ text = 'Loading...' }) => (
    <div className="flex items-center justify-center min-h-[calc(100vh-104px)]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{text}</p>
        </div>
    </div>
);

export default FullScreenLoader;
