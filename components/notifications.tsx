import { notification } from 'antd';
export const ErrorNotification = (error) => {
    notification.open({
        message: 'Error',
        description:
        error,
        onClick: () => {
            console.log('Notification Clicked!');
        },
    });
}

export const SuccessNotification = (message) => {
    notification.open({
        message: 'Success',
        description: message,
        onClick: () => {
            console.log('Notification Clicked!');
        },
    });
}