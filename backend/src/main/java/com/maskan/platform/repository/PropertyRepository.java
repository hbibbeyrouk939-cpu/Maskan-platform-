package com.maskan.platform.repository;

import com.maskan.platform.domain.entity.Property;
import com.maskan.platform.domain.enums.PropertyStatus;
import com.maskan.platform.domain.enums.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findAllByActiveTrueOrderByCreatedAtAsc();
    Optional<Property> findByIdAndActiveTrue(UUID id);
    List<Property> findAllByActiveTrueAndType(PropertyType type);
    List<Property> findAllByActiveTrueAndStatus(PropertyStatus status);
}
