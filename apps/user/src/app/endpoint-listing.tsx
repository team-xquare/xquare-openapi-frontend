"use client";

import { Fragment } from "react";
import { ENDPOINT_ACCESS_LABELS, type EndpointGroup } from "./all-content";
import {
  AccessBadge,
  EndpointCard,
  EndpointCardLink,
  EndpointDescription,
  EndpointGroupHeader,
  EndpointGroupSection,
  EndpointList,
  EndpointMethod,
  EndpointPage,
  ListHeader,
  PageDivider,
  WelcomeHeading,
  WelcomeLead,
} from "./all/page-style";

export function PageWelcome() {
  return (
    <ListHeader>
      <WelcomeHeading>Welcome, Back</WelcomeHeading>
      <WelcomeLead>Access school information via xquare</WelcomeLead>
    </ListHeader>
  );
}

export function EndpointListing({ groups }: { groups: EndpointGroup[] }) {
  return (
    <EndpointPage>
      <PageWelcome />
      <PageDivider />

      <EndpointList aria-label="엔드포인트 목록">
        {groups.map((group) => (
          <EndpointGroupSection key={group.id} id={group.id}>
            <EndpointGroupHeader>
              <h2>{group.title}</h2>
              {group.access && (
                <AccessBadge access={group.access}>
                  {ENDPOINT_ACCESS_LABELS[group.access]}
                </AccessBadge>
              )}
            </EndpointGroupHeader>
            <div>
              {group.endpoints.map((endpoint, index) => {
                const card = (
                  <EndpointCard>
                    <EndpointMethod>{endpoint.method}</EndpointMethod>
                    <EndpointDescription>
                      {endpoint.description}
                    </EndpointDescription>
                  </EndpointCard>
                );

                return endpoint.detailId ? (
                  <EndpointCardLink
                    key={`${group.id}-${index}`}
                    href={`/${group.id}/${endpoint.detailId}`}
                  >
                    {card}
                  </EndpointCardLink>
                ) : (
                  <Fragment key={`${group.id}-${index}`}>{card}</Fragment>
                );
              })}
            </div>
          </EndpointGroupSection>
        ))}
      </EndpointList>
    </EndpointPage>
  );
}
