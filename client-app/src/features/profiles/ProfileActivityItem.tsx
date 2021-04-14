import { profile } from "node:console";
import { truncate } from "node:fs";
import React from "react";
import { Link } from "react-router-dom";
import { Card, Grid, Icon, Image, Tab } from "semantic-ui-react";
import { UserActivity } from "../../app/models/profile";
import FollowButton from "./FollowButton";
import { format, parseISO } from "date-fns";

interface Props {
  userActivities: UserActivity[];
  loadingActivities: boolean;
}
export default function ProfileActivityItem({
  userActivities,
  loadingActivities,
}: Props) {
  return (
    <Tab.Pane loading={loadingActivities} style={{ border: "none" }}>
      <Grid>
        <Grid.Column width={16}>
          <Card.Group itemsPerRow={4} style={{ "text-align": "center" }}>
            {userActivities.map((userActivity) => (
              <Card
                key={userActivity.id}
                as={Link}
                to={`/activities/${userActivity.id}`}
              >
                <Image
                  src={`/assets/categoryImages/${userActivity.category}.jpg`}
                />
                <Card.Content>
                  <Card.Header>{userActivity.title}</Card.Header>
                  <Card.Description>
                    <div>{format(new Date(userActivity.date), "do LLL")}</div>
                    <div>{format(new Date(userActivity.date), "h:mm a")}</div>
                  </Card.Description>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
}
