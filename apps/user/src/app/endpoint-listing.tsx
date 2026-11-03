"use client";

import { Fragment } from "react";
import type { EndpointGroup } from "./all-content";
import {
  EndpointCard,
  EndpointCardLink,
  EndpointDescription,
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
            <h2>{group.title}</h2>
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
