package com.maskan.platform.controller;

import com.maskan.platform.dto.PropertyDtos.*;
import com.maskan.platform.service.PropertyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@Tag(name = "Properties")
public class PropertyController {
    private final PropertyService propertyService;

    @GetMapping
    public List<PropertyResponse> listAll() {
        return propertyService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PropertyResponse create(@Valid @RequestBody UpsertPropertyRequest request) {
        return propertyService.create(request);
    }

    @PutMapping("/{id}")
    public PropertyResponse update(@PathVariable UUID id, @Valid @RequestBody UpsertPropertyRequest request) {
        return propertyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        propertyService.softDelete(id);
    }
}
