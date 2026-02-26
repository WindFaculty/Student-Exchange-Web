package com.ssg.iot.repository;

import com.ssg.iot.domain.IotComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IotComponentRepository extends JpaRepository<IotComponent, Long>, JpaSpecificationExecutor<IotComponent> {
}
