package com.ssg.iot;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.hamcrest.Matchers.*;
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
                .andExpect(jsonPath("$.categoryOptions", containsInAnyOrder(
                        "COMPONENT",
                        "ELECTRONICS",
                        "SAMPLE_KIT",
                        "KIT",
                        "IOT_SERVICE",
                        "MENTORING",
                        "CONSULTATION",
                        "SERVICE"
                )))
                .andExpect(jsonPath("$.listings.content").isArray());
    }

    @Test
    void getIotOverviewFiltersByLegacyCategory() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("category", "KIT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content[*].category", everyItem(is("KIT"))));
    }

    @Test
    void getIotOverviewRejectsInvalidCategory() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("category", "INVALID_CATEGORY"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid IoT category")));
    }

    @Test
    void getIotOverviewFiltersBySegment() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("segment", "SERVICES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content[*].category", everyItem(anyOf(
                        is("IOT_SERVICE"),
                        is("MENTORING"),
                        is("CONSULTATION"),
                        is("SERVICE")
                ))));
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
                        .param("category", "KIT"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("category and segment cannot be used together")));
    }

    @Test
    void getIotOverviewSupportsLegacyCategoryAliases() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("category", "CONSULTATION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content[*].category", everyItem(is("CONSULTATION"))));
    }

    @Test
    void getIotOverviewSupportsSearch() throws Exception {
        mockMvc.perform(get("/api/iot/overview").param("search", "iot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listings.content[0].title", containsString("IoT")));
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
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "admin",
                                  "password": "admin123"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) result.getRequest().getSession(false);
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
