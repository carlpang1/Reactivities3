import React, { SyntheticEvent, useEffect, useState } from "react";
import { Card, Grid, Header, Tab, TabProps } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import ProfileActivityItem from "./ProfileActivityItem";
import { observer } from "mobx-react-lite";

export default observer(function ProfileActivities() {
  const {
    profileStore: { loadingActivities, userActivities, loadActivities },
  } = useStore();
  const [predicate, setPredicate] = useState("future");

  const panes = [
    { menuItem: "Future Events", pane: { key: "future" } },
    { menuItem: "Past Events", pane: { key: "past" } },
    { menuItem: "Hosting", pane: { key: "hosting" } },
  ];

  useEffect(() => {
    loadActivities(predicate);
  }, [predicate, loadActivities]);

  const handleTabChange = (e: SyntheticEvent, data: TabProps) => {
    setPredicate(panes[data.activeIndex as number].pane.key);
  };

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16}>
          <Header floated="left" icon="calendar" content="Activities" />
        </Grid.Column>
        <Grid.Column width={16}>
          <Tab
            menu={{ secondary: true, pointing: true }}
            panes={panes}
            onTabChange={(e, data) => {
              handleTabChange(e, data);
            }}
          />
          <br />
          <ProfileActivityItem
            userActivities={userActivities}
            loadingActivities={loadingActivities}
          />
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
});
