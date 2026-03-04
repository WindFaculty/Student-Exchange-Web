package com.ssg.iot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class IotApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void contextLoads() {
    }

    @Test
    void registerCreatesUserAndReturnsUserSession() throws Exception {
        String username = "newstudent";
        String email = "newstudent@example.com";

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "newstudent",
                                  "email": "newstudent@example.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Registration successful")))
                .andExpect(jsonPath("$.user.username", is(username)))
                .andExpect(jsonPath("$.user.email", is(email)))
                .andExpect(jsonPath("$.user.fullName", is(username)))
                .andExpect(jsonPath("$.user.role", is("USER")))
                .andReturn();

        MockHttpSession userSession = (MockHttpSession) result.getRequest().getSession(false);
        mockMvc.perform(get("/api/auth/me").session(userSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(username)))
                .andExpect(jsonPath("$.email", is(email)))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    void registerRejectsDuplicateUsername() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "student1",
                                  "email": "new-student@example.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Username is already taken")));
    }

    @Test
    void registerRejectsDuplicateEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "new-user-2",
                                  "email": "student1@example.com",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Email is already registered")));
    }

    @Test
    void registerRejectsInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "",
                                  "email": "not-an-email",
                                  "password": "123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("email")));
    }

    @Test
    void trackOrderWithoutParamsReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/orders/track"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Missing required parameter")));
    }

    @Test
    void trackSupportTicketWithoutParamsReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/support/tickets/track"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Missing required parameter")));
    }

    @Test
    void getIotOverviewReturnsContentAndAllowedCategories() throws Exception {
        mockMvc.perform(get("/api/iot/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.heroTitle", not(isEmptyOrNullString())))
                .andExpect(jsonPath("$.categoryOptions[*].code", hasItem("SAMPLE_PROJECT")))
                .andExpect(jsonPath("$.listings.content").isArray());
    }

    @Test
    void getIotOverviewFiltersByCategoryCode() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("categoryCode", "IOT_SAMPLE_KIT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content[*].category.code", everyItem(is("IOT_SAMPLE_KIT"))));
    }

    @Test
    void getIotOverviewAcceptsAnyCategoryCodeAsFilter() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("categoryCode", "UNKNOWN_CODE"))
                .andExpect(status().isOk());
    }

    @Test
    void getIotOverviewFiltersBySegment() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("segment", "SERVICES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content").isArray());
    }

    @Test
    void getIotOverviewRejectsInvalidSegment() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("segment", "INVALID_SEGMENT"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid IoT segment")));
    }

    @Test
    void getIotOverviewRejectsCategoryAndSegmentTogether() throws Exception {
        mockMvc.perform(get("/api/iot/overview")
                        .param("segment", "SERVICES")
                        .param("categoryCode", "IOT_SAMPLE_KIT"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("categoryCode and segment cannot be used together")));
    }

    @Test
    void getIotOverviewSupportsSearch() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("search", "iot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content[0].title", containsString("IoT")));
    }

    @Test
    void ownerCanRestoreArchivedListingAndPublicEndpointsSeeItAgain() throws Exception {
        MockHttpSession ownerSession = loginAsUser("student1", "user123");
        String uniqueTitle = "restore-owner-" + System.nanoTime();
        long listingId = createListing(ownerSession, uniqueTitle);

        mockMvc.perform(delete("/api/listings/{id}", listingId).session(ownerSession))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/listings/{id}", listingId))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/listings/{id}/restore", listingId).session(ownerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is(uniqueTitle)))
                .andExpect(jsonPath("$.active", is(true)));

        mockMvc.perform(get("/api/listings/{id}", listingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is(uniqueTitle)))
                .andExpect(jsonPath("$.active", is(true)));

        mockMvc.perform(get("/api/listings").param("search", uniqueTitle))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].title", hasItem(uniqueTitle)));
    }

    @Test
    void restoreListingFailsForNonOwner() throws Exception {
        MockHttpSession ownerSession = loginAsUser("student1", "user123");
        String uniqueTitle = "restore-forbidden-" + System.nanoTime();
        long listingId = createListing(ownerSession, uniqueTitle);

        mockMvc.perform(delete("/api/listings/{id}", listingId).session(ownerSession))
                .andExpect(status().isOk());

        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        MockHttpSession anotherUserSession = registerAndLogin(
                "restore_user_" + suffix,
                "restore_" + suffix + "@example.com",
                "secret123"
        );

        mockMvc.perform(post("/api/listings/{id}/restore", listingId).session(anotherUserSession))
                .andExpect(status().isForbidden());
    }

    @Test
    void restoreListingReturnsNotFoundForMissingId() throws Exception {
        MockHttpSession ownerSession = loginAsUser("student1", "user123");
        mockMvc.perform(post("/api/listings/{id}/restore", 99999999L).session(ownerSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAdminIotContentWithoutLoginReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/iot/content"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateAdminIotContentRejectsTooManyHighlights() throws Exception {
        MockHttpSession adminSession = loginAsAdmin();
        String payload = buildIotContentPayload("IoT Hub qua so luong", 7, false);

        mockMvc.perform(put("/api/admin/iot/content")
                        .session(adminSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateAdminIotContentRejectsDuplicateDisplayOrder() throws Exception {
        MockHttpSession adminSession = loginAsAdmin();
        String payload = buildIotContentPayload("IoT Hub duplicate order", 3, true);

        mockMvc.perform(put("/api/admin/iot/content")
                        .session(adminSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("displayOrder must be unique")));
    }

    @Test
    void updateAdminIotContentPersistsChanges() throws Exception {
        MockHttpSession adminSession = loginAsAdmin();
        String updatedHeroTitle = "IoT Hub cap nhat tu test";
        String payload = buildIotContentPayload(updatedHeroTitle, 3, false);

        mockMvc.perform(put("/api/admin/iot/content")
                        .session(adminSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.heroTitle", is(updatedHeroTitle)));

        mockMvc.perform(get("/api/admin/iot/content").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.heroTitle", is(updatedHeroTitle)));
    }

    private MockHttpSession loginAsAdmin() throws Exception {
        return loginAsUser("admin", "admin123");
    }

    private MockHttpSession loginAsUser(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "password": "%s"
                                }
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertTrue(session != null, "Expected login session to be created");
        return session;
    }

    private MockHttpSession registerAndLogin(String username, String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(username, email, password)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession(false);
        assertTrue(session != null, "Expected register session to be created");
        return session;
    }

    private long createListing(MockHttpSession session, String title) throws Exception {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("title", title);
        payload.put("description", "Listing for restore tests");
        payload.put("categoryCode", "OTHER");
        payload.put("price", 100000);
        payload.put("stock", 3);
        payload.put("imageUrl", "https://example.com/restore.png");

        MvcResult result = mockMvc.perform(post("/api/listings")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload.toString()))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.path("id").asLong();
    }

    private String buildIotContentPayload(String heroTitle, int highlightCount, boolean duplicateDisplayOrder) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("heroTitle", heroTitle);
        root.put("heroSubtitle", "Noi dung hero cap nhat tu test");
        root.put("heroImageUrl", "https://example.com/iot-hero.jpg");
        root.put("primaryCtaLabel", "Dang san pham IoT");
        root.put("primaryCtaHref", "/listings");

        ArrayNode highlights = root.putArray("highlights");
        for (int i = 1; i <= highlightCount; i++) {
            ObjectNode item = highlights.addObject();
            item.put("title", "Highlight " + i);
            item.put("description", "Mo ta " + i);
            item.put("icon", "memory");
            item.put("displayOrder", duplicateDisplayOrder && i == highlightCount ? 1 : i);
        }

        return objectMapper.writeValueAsString(root);
    }
}
