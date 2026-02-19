package com.ssg.iot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class IotApplicationTests {

    @Autowired
    private MockMvc mockMvc;

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
}
