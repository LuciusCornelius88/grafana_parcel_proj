import fs from 'fs';
import fetch from 'node-fetch';
var path = require('path');
var Buffer = require('buffer/').Buffer;

async function getAllDashboards(input) {
  const { grafanaUrl, headers } = input;

  const getAllDashboardsApiEndpoint = `${grafanaUrl}/api/search?type=dash-db`;
  const response = await fetch(getAllDashboardsApiEndpoint, {
    headers: headers,
  });
  const dashboards = await response.json();

  return dashboards;
}

async function iterateDashboard(input, dashboard) {
  let { grafanaUrl, headers } = input;

  let getDashboardJSONUrl = `${grafanaUrl}/api/dashboards/uid/${dashboard['uid']}`;
  let response = await fetch(getDashboardJSONUrl, { headers: headers });
  let dashboardJSON = await response.json();

  let panelIDs = {};

  try {
    let panels = dashboardJSON['dashboard']['panels'];

    panels.forEach((panel) => {
      try {
        let panelTitle = panel['title'] + '_' + panel['id'];
        panelIDs[panelTitle] = panel['id'];
      } catch (e) {
        panelIDs[`${panel['id']}`] = panel['id'];
      }
    });
  } catch (e) {
    let panels = dashboardJSON['dashboard']['rows'].map((row) => row['panels']);
    panels.forEach((panelsArray) => {
      panelsArray.forEach((panel) => {
        let panelTitle = panel['title'] + '_' + panel['id'];
        panelIDs[panelTitle] = panel['id'];
      });
    });
  }

  let dashboardTitle = dashboardJSON['meta']['folderTitle'] + ' // ' + dashboardJSON['dashboard']['title'];

  return { dashboardTitle, panelIDs };
}

async function getDashboardsPanelsInfo(input) {
  const dashboards = await getAllDashboards(input);
  const dashboardsPanelInfo = {};

  for (const dashboard of dashboards) {
    const { dashboardTitle, panelIDs } = await iterateDashboard(input, dashboard);
    dashboardsPanelInfo[dashboardTitle] = {
      dashboardUID: dashboard['uid'],
      panelIDs: panelIDs,
    };
  }

  return dashboardsPanelInfo;
}

async function getDashboardImg(input) {
  const { imgData: data, headers } = input;

  const { grafanaUrl: url, dashboardUID: uid, orgId, panelID, img, from, to, width, height } = data;

  const imgRenderUrl = `${url}/render/d-solo/${uid}?orgId=${orgId}&panelId=${panelID}&from=${from}&to=${to}
                        &width=${width}&height=${height}`;

  const response = await fetch(imgRenderUrl, { headers: headers });
  const imageBuffer = await response.arrayBuffer();

  //   const outputFileName = `output_${img}.png`;
  //   const outputPath = path.join(process.cwd(), 'images', outputFileName);

  //   fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
}

export { getAllDashboards, iterateDashboard, getDashboardsPanelsInfo, getDashboardImg };
