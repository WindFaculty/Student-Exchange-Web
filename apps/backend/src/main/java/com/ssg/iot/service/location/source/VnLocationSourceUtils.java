package com.ssg.iot.service.location.source;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

final class VnLocationSourceUtils {

    private VnLocationSourceUtils() {
    }

    static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        return normalized.isEmpty() ? null : normalized;
    }

    static String firstText(JsonNode node, String... keys) {
        if (node == null || keys == null) {
            return null;
        }
        for (String key : keys) {
            if (key == null) {
                continue;
            }
            JsonNode value = node.get(key);
            if (value != null && !value.isNull()) {
                String raw = value.asText();
                String normalized = normalize(raw);
                if (normalized != null) {
                    return normalized;
                }
            }
        }
        return null;
    }

    static boolean firstBoolean(JsonNode node, boolean defaultValue, String... keys) {
        if (node == null || keys == null) {
            return defaultValue;
        }
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value == null || value.isNull()) {
                continue;
            }
            if (value.isBoolean()) {
                return value.asBoolean();
            }
            String text = normalize(value.asText());
            if (text == null) {
                continue;
            }
            if ("true".equalsIgnoreCase(text) || "1".equals(text) || "yes".equalsIgnoreCase(text)) {
                return true;
            }
            if ("false".equalsIgnoreCase(text) || "0".equals(text) || "no".equalsIgnoreCase(text)) {
                return false;
            }
        }
        return defaultValue;
    }

    static LocalDate firstDate(JsonNode node, String... keys) {
        String text = firstText(node, keys);
        if (text == null) {
            return null;
        }
        try {
            return LocalDate.parse(text);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    static JsonNode firstArray(JsonNode node, String... keys) {
        if (node == null || keys == null) {
            return null;
        }
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value != null && value.isArray()) {
                return value;
            }
        }
        return null;
    }

    static String firstCode(JsonNode node, String... keys) {
        String value = firstText(node, keys);
        if (value == null) {
            return null;
        }
        return value;
    }
}
