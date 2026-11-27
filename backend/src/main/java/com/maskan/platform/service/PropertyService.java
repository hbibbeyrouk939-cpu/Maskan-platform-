package com.maskan.platform.service;

import com.maskan.platform.domain.entity.Property;
import com.maskan.platform.dto.PropertyDtos.*;
import com.maskan.platform.exception.ResourceNotFoundException;
import com.maskan.platform.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private static final Map<String, String> IMAGE_CATALOG = Map.of(
        "img1", "/assets/property-01.webp",
        "img2", "/assets/property-02.webp",
        "img3", "/assets/property-03.webp",
        "img4", "/assets/property-04.webp"
    );

    private final PropertyRepository propertyRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PropertyResponse> listAll() {
        return propertyRepository.findAllByActiveTrueOrderByCreatedAtAsc().stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public PropertyResponse create(UpsertPropertyRequest req) {
        String code = "p" + (propertyRepository.count() + 1);
        Property entity = Property.builder()
            .code(code)
            .nameAr(req.nameAr().trim())
            .nameFr(req.nameFr().trim())
            .type(req.type())
            .districtAr(req.districtAr().trim())
            .districtFr(req.districtFr().trim())
            .rooms(req.rooms())
            .areaSqm(req.areaSqm())
            .pricePerNightUsd(req.pricePerNightUsd())
            .status(req.status())
            .imageKey(req.imageKey())
            .imageUrl(IMAGE_CATALOG.getOrDefault(req.imageKey(), "/assets/property-01.webp"))
            .build();
        Property saved = propertyRepository.save(entity);
        auditService.record("PROPERTY_CREATED", "PROPERTY", saved.getId().toString(), Map.of("code", saved.getCode()));
        return toDto(saved);
    }

    @Transactional
    public PropertyResponse update(UUID id, UpsertPropertyRequest req) {
        Property entity = propertyRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("error.property.not_found", id));
        entity.setNameAr(req.nameAr().trim());
        entity.setNameFr(req.nameFr().trim());
        entity.setType(req.type());
        entity.setDistrictAr(req.districtAr().trim());
        entity.setDistrictFr(req.districtFr().trim());
        entity.setRooms(req.rooms());
        entity.setAreaSqm(req.areaSqm());
        entity.setPricePerNightUsd(req.pricePerNightUsd());
        entity.setStatus(req.status());
        entity.setImageKey(req.imageKey());
        entity.setImageUrl(IMAGE_CATALOG.getOrDefault(req.imageKey(), "/assets/property-01.webp"));
        Property saved = propertyRepository.save(entity);
        auditService.record("PROPERTY_UPDATED", "PROPERTY", saved.getId().toString(), Map.of("code", saved.getCode()));
        return toDto(saved);
    }

    @Transactional
    public void softDelete(UUID id) {
        Property entity = propertyRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("error.property.not_found", id));
        entity.setActive(false);
        propertyRepository.save(entity);
        auditService.record("PROPERTY_DELETED", "PROPERTY", id.toString(), Map.of("code", entity.getCode()));
    }

    private PropertyResponse toDto(Property p) {
        return new PropertyResponse(
            p.getId(), p.getCode(), p.getNameAr(), p.getNameFr(), p.getType(),
            p.getDistrictAr(), p.getDistrictFr(), p.getRooms(), p.getAreaSqm(),
            p.getPricePerNightUsd(), p.getStatus(), p.getImageKey(), p.getImageUrl()
        );
    }
}
