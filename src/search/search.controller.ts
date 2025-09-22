import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchPostsDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() searchDto: SearchPostsDto) {
    return this.searchService.searchAndFetchFullPosts(searchDto);
  }
}
