"use client";

import type { EndpointGroup } from "./all-content";
import {
  EndpointCard,
  EndpointDescription,
  EndpointGroupSection,
  EndpointList,
  EndpointMethod,
  EndpointPage,
  ListHeader,
  LogoutButton,
  PageDivider,
  WelcomeCopy,
  WelcomeHeading,
  WelcomeLead,
} from "./all/page-style";

export function PageWelcome() {
  return (
    <ListHeader>
      <WelcomeCopy>
        <WelcomeHeading>Welcome, Back</WelcomeHeading>
        <WelcomeLead>Access school information via xquare</WelcomeLead>
      </WelcomeCopy>
      <LogoutButton type="button">로그아웃</LogoutButton>
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
              {group.endpoints.map((endpoint, index) => (
                <EndpointCard key={`${group.id}-${index}`}>
                  <EndpointMethod>{endpoint.method}</EndpointMethod>
                  <EndpointDescription>
                    {endpoint.description}
                  </EndpointDescription>
                </EndpointCard>
              ))}
            </div>
          </EndpointGroupSection>
        ))}
      </EndpointList>
    </EndpointPage>
  );
}
