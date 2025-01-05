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

    // .create 함수는 무슨 기능인지?
    // 리턴 타입은 무엇인지?
    const apiEndpoint = await this.apiEndpointRepository.create({
      url,
      parameters,
      callTime,
    });

    // .save 함수는 무슨 기능인지?
    // 리턴 타입은 무엇인지?
    // .create 함수와 차이점은 무엇인지?
    await this.apiEndpointRepository.save(apiEndpoint);

    return await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });
  }

  async getAllEndpoints() {
    return this.apiEndpointRepository.find();
  }

<<<<<<< HEAD
  async findById(id: number) {
    
    const existsById= await this.apiEndpointRepository.findOne({
=======
  async findByUrl(id: number) {
    const existsByUrl = await this.apiEndpointRepository.findOne({
>>>>>>> deeb55c (add-cronjob)
      where: {
        id,
      },
    });

<<<<<<< HEAD
    if (!existsById) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`)
    };
=======
    if (!existsByUrl) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`);
    }
>>>>>>> deeb55c (add-cronjob)

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

    // new~ 보다는 updated~ 가 더 맞는 표현아닌가?
    const newApiEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    return newApiEndpoint;
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

  // DTO를 엔티티로 받는게 맞는지?
  async sendApiRequest(apiEndpoint: ApiEndpoint) {
    const url = apiEndpoint.url;
    const parameters = apiEndpoint.parameters;
    // 이렇게 쓰는게 어떤지?
    // const { url, parameters } = apiEndpoint;
    const retries = 3;

    for (let i = 1; i <= retries; i++) {
      const startTime = Date.now();
      // 이렇게 쓰는게 어떤지?
      // const currentTime = new Date();

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

        const responseTime = Date.now() - startTime;

        const apiResponse = {
          responseTime,
          body: response.data.substring(0, 255),
          statusCode: response.status,
          success: true,
        };

        await this.apiResponseRepository.save(apiResponse);
        // 리턴을 DB에 저장한거 말고 만들어놓은 apiResponse를 리턴하는게 맞는지?
        return apiResponse;
      } catch (error) {
        if (error.response && error.response.status === 500) {
          console.warn(`HTTP 500 에러 발생. 재시도 중 (${i}/${retries})`);

          console.log("----------");
          console.log(error);

          if (i === retries) {
            console.error(`최대 재시도 횟수 초과: ${apiEndpoint.url}`);

            const apiResponse = {
              responseTime: 5000,
              // 5000 이라는 숫자는 무슨 의미인가?
              statusCode: 1300,
              // 1300 이라는 숫자는 무슨 의미인가?
              body: "요청 및 재시도 실패",
              success: false,
            };

            await this.apiResponseRepository.save(apiResponse);

            console.log(
              `${apiEndpoint.url} 의 요청이 실패하였습니다. ID: ${apiEndpoint.id}`
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
