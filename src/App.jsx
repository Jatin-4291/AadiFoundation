import "./App.css";
import React, { useState } from "react";
import FacebookLogin from "@greatsumini/react-facebook-login";
import axios from "axios";

const App = () => {
  const [userData, setUserData] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageMetrics, setPageMetrics] = useState(null);

  const responseFacebook = (response) => {
    console.log(response);
    setUserData({
      name: response.name,
      picture: response.picture.data.url,
      accessToken: response.accessToken,
    });
    console.log(response.accessToken);
    // Fetch user's pages
    axios
      .get(
        `https://graph.facebook.com/me/accounts?access_token=${response.accessToken}`
      )
      .then((res) => {
        setPages(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handlePageSelect = (pageId) => {
    setSelectedPage(pageId);

    // Fetch page metrics
    axios
      .get(
        `https://graph.facebook.com/${pageId}/insights?metric=page_fans,page_engaged_users,page_impressions,page_actions_post_reactions_total&since=START_DATE&until=END_DATE&period=total_over_range&access_token=${userData.accessToken}`
      )
      .then((res) => {
        const metrics = res.data.data.reduce((acc, metric) => {
          acc[metric.name] = metric.values[0].value;
          return acc;
        }, {});
        setPageMetrics(metrics);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {!userData ? (
        <FacebookLogin
          appId="1163394688334237"
          autoLoad={true}
          fields="name,email,picture"
          callback={responseFacebook}
          cssClass="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        />
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">
            Welcome, {userData.name}
          </h1>
          <img
            src={userData.picture}
            alt="User"
            className="rounded-full w-24 h-24 mb-4 mx-auto"
          />

          <select
            className="w-full p-2 border border-gray-300 rounded mb-4"
            onChange={(e) => handlePageSelect(e.target.value)}
          >
            <option value="">Select a page</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>

          {pageMetrics && (
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 rounded shadow-md">
                <h2 className="text-lg font-semibold text-blue-900">
                  Total Followers / Fans
                </h2>
                <p className="text-blue-700 text-xl">{pageMetrics.page_fans}</p>
              </div>
              <div className="p-4 bg-green-50 rounded shadow-md">
                <h2 className="text-lg font-semibold text-green-900">
                  Total Engagement
                </h2>
                <p className="text-green-700 text-xl">
                  {pageMetrics.page_engaged_users}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded shadow-md">
                <h2 className="text-lg font-semibold text-yellow-900">
                  Total Impressions
                </h2>
                <p className="text-yellow-700 text-xl">
                  {pageMetrics.page_impressions}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded shadow-md">
                <h2 className="text-lg font-semibold text-red-900">
                  Total Reactions
                </h2>
                <p className="text-red-700 text-xl">
                  {pageMetrics.page_actions_post_reactions_total}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
