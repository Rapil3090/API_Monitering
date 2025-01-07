import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from "@nestjs/common";
import { CreateApiEndpointDto } from "./dto/create-api-endpoint.dto";
import { UpdateApiEndpointDto } from "./dto/update-api-endpoint.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ApiEndpoint } from "./entities/api-endpoint.entity";
import { Repository } from "typeorm";
import axios, { AxiosResponse } from "axios";
import { ApiResponse } from "src/api-response/entities/api-response.entity";
import { RequestApiEndpointDto } from "./dto/request-api-endpoint.dto";

@Injectable()
export class ApiEndpointService {
  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: Repository<ApiEndpoint>,
    @InjectRepository(ApiResponse)
    private readonly apiResponseRepository: Repository<ApiResponse>,
    @Inject("TIMERS_MAP") private readonly timers: Map<number, NodeJS.Timeout>
  ) {}

  async create(createApiEndpointDto: CreateApiEndpointDto) {
    const { url, parameters, callTime } = createApiEndpointDto;

    const existingUrl = await this.apiEndpointRepository.findOne({
      where: {
        url: createApiEndpointDto.url,
      },
    });

    if (existingUrl) {
      throw new BadRequestException(`이미 저장된 url입니다. ${url}`);
    }

    await this.apiEndpointRepository.save(createApiEndpointDto);

    return await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });
  }

  async getAllEndpoints() {
    return this.apiEndpointRepository.find();
  }

  async findById(id: number) {
    const existsById = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    if (!existsById) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`);
    }

    return existsById;
  }

  async update(updateApiEndpointDto: UpdateApiEndpointDto) {
    const { id, url, parameters, callTime } = updateApiEndpointDto;

    const apiEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    const existingEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });

    if (existingEndpoint && id !== existingEndpoint.id) {
      throw new BadRequestException(`중복된 url : ${url} 입니다.`);
    }

    await this.apiEndpointRepository.update(
      {
        id,
      },
      {
        url,
        parameters,
        callTime,
      }
    );

    const updatedApiEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    return updatedApiEndpoint;
  }

  async remove(id: number) {
    const existsByUrl = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    if (!existsByUrl) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`);
    }

    await this.apiEndpointRepository.delete(id);

    return "ok";
  }

  async sendApiRequest(apiEndpointDto : RequestApiEndpointDto) {
    const { url, parameters } = apiEndpointDto;

    const retries = 3;

    for (let i = 1; i <= retries; i++) {
      const currentTime = new Date();


      try {
        const response: AxiosResponse = await axios.get(url, {
          params: parameters.reduce((acc, param) => {
            if (param.type.toLowerCase() === "query") {
              acc[param.key] = param.value;
            }
            return acc;
          }, {}),

          headers: parameters.reduce((acc, param) => {
            if (param.type.toLowerCase() === "header") {
              acc[param.key] = param.value;
            }
            return acc;
          }, {}),
        });

        const endTime = new Date();

        const responseTime = endTime.getTime() - currentTime.getTime();

        const apiResponse = {
          responseTime,
          body: response.data.substring(0, 255),
          statusCode: response.status,
          success: true,
        };

        const savedApiResponse = await this.apiResponseRepository.save(apiResponse);
        
        return savedApiResponse;
        
      } catch (error) {
        if (error.response.status >= 500 && error.response.status < 600) {
          console.warn(`서버 에러 발생. 재시도 중 (${i}/${retries})`);

          console.log("----------");
          console.log(error);

          if (i === retries) {
            console.error(`최대 재시도 횟수 초과: ${apiEndpointDto.url}`);
            
            const  errorOccurredAt = new Date();

            const elapsedTime = errorOccurredAt.getTime() - currentTime.getTime();
            
            const apiResponse = {
              responseTime: elapsedTime,
              statusCode: error.response.status,
              body: "요청 및 재시도 실패",
              success: false,
            };

            await this.apiResponseRepository.save(apiResponse);

            console.log(
              `${apiEndpointDto.url} 의 요청이 ${retries}회 실패하였습니다. ID: ${apiEndpointDto.id}`
            );
          }

          continue;
        }
      }
    }
  }

  async scheduledApiCall(): Promise<void> {
    const apiEndpoints = await this.apiEndpointRepository.find();
    apiEndpoints.forEach((apiEndpoint) => {
      // 타이머를 왜 만든건지?
      // 일정 주기로 실행되게 하고싶으면 cronjob 사용(추가된 모듈 확인)
      if (this.timers.has(apiEndpoint.id)) {
        console.log(
          `이미 실행중인 타이머가 있습니다. (${apiEndpoint.url}, id${apiEndpoint.id})`
        );
        return;
      }

      const timer = setInterval(() => {
        this.sendApiRequest(apiEndpoint)
          .then((response) => console.log("응답", response))
          .catch((error) => console.log("에러", error.message));
      }, apiEndpoint.callTime);

      this.timers.set(apiEndpoint.id, timer);
    });
  }

  stopAllTimer() {
    this.timers.forEach((timer, id) => {
      clearInterval(timer);
    });
    this.timers.clear();
  }
}
