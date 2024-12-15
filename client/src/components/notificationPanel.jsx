import { Popover, Transition } from "@headlessui/react";
import moment from "moment";
import { Fragment, useState, useEffect } from "react";
import { BiSolidMessageRounded } from "react-icons/bi";
import { HiBellAlert } from "react-icons/hi2";
import { IoIosNotificationsOutline } from "react-icons/io";
import axios from "axios";
import { useParams } from "react-router-dom";

const ICONS = {
  alert: (
    <HiBellAlert className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
  ),
  message: (
    <BiSolidMessageRounded className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
  ),
};

const NotificationPanel = () => {
  const { id } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null); // State for modal
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:3000/getnotification/${id}`);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotifications();
    }
  }, [id]);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:3000/read-noti/${id}/dummyId?all=true`);
      setNotifications([]);
      window.location.reload();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Handle modal actions
  const viewNotification = (notification) => {
    setSelectedNotification(notification);
  };

  const markNotificationAsRead = async (notification) => {
    try {
      await axios.put(`http://localhost:3000/read-noti/${id}/${notification._id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((noti) => noti._id !== notification._id)
      );
      setSelectedNotification(null);
      window.location.reload();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <>
      <Popover className="relative">
        <Popover.Button className="inline-flex items-center outline-none">
          <div className="w-8 h-8 flex items-center justify-center text-gray-800 relative">
            <IoIosNotificationsOutline className="text-3xl" />
            {notifications.length > 0 && (
              <span className="absolute text-center top-0 right-1 text-xs text-white font-semibold w-4 h-4 rounded-full bg-red-600">
                {notifications.length}
              </span>
            )}
          </div>
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute -right-16 md:-right-2 z-10 mt-5 flex w-screen max-w-max px-4">
            {({ close }) => (
              <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                <div className="p-4">
                  {loading ? (
                    <p>Loading...</p>
                  ) : notifications.length > 0 ? (
                    notifications.slice(0, 5).map((item, index) => (
                      <div
                        key={item._id + index}
                        className="group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-lg bg-gray-200 group-hover:bg-white">
                          {ICONS[item.notiType]}
                        </div>

                        <div
                          className="cursor-pointer"
                          onClick={() => viewNotification(item)}
                        >
                          <div className="flex items-center gap-3 font-semibold text-gray-900 capitalize">
                            <p>{item.notiType}</p>
                            <span className="text-xs font-normal lowercase">
                              {moment(item.createdAt).fromNow()}
                            </span>
                          </div>
                          <p className="line-clamp-1 mt-1 text-gray-600">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No new notifications.</p>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="grid grid-cols-2 divide-x bg-gray-50">
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-blue-600 hover:bg-gray-100"
                    >
                      Mark All Read
                    </button>
                    <button
                      onClick={() => close()}
                      className="flex items-center justify-center gap-x-2.5 p-3 font-semibold text-blue-600 hover:bg-gray-100"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>

      {/* Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-lg font-bold mb-4">Notification Details</h2>
            <p className="mb-4">{selectedNotification.text}</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => markNotificationAsRead(selectedNotification)}
              >
                Mark as Read
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationPanel;
